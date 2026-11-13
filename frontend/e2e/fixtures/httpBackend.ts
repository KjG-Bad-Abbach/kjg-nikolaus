import assert from 'node:assert/strict';
import { createServer, type IncomingHttpHeaders, type ServerResponse } from 'node:http';
import { cloneScenario, createResumeScenario } from './scenarioFactory';
import type { BookingRecord, BookingScenario, FailureStage } from './types';

export const HTTP_TOKEN = 'public-http-contract-test-token';
export const HTTP_BOOKING_ID = 'http-booking-document';
export const HTTP_BOOKING_NUMERIC_ID = 401;
export const bookingDetails = createResumeScenario().bookings[0];

interface RecordedRequest {
  method: string;
  path: string;
  query: string;
  headers: IncomingHttpHeaders;
  body: unknown;
  status: number;
}

export interface HttpBackend {
  baseUrl: string;
  state: BookingScenario;
  requests: RecordedRequest[];
  violations: string[];
  verificationLinks: string[];
  close: () => Promise<void>;
}

function respond(response: ServerResponse, status: number, body: unknown): void {
  response.writeHead(status, { 'Content-Type': 'application/json' });
  response.end(JSON.stringify(body));
}

function bookingAttributes(booking: BookingRecord): Record<string, unknown> {
  return {
    id: HTTP_BOOKING_NUMERIC_ID,
    documentId: booking.documentId,
    present_location: booking.present_location,
    additional_notes: booking.additional_notes,
  };
}

function validatePayload(body: unknown, state: BookingScenario): Partial<BookingRecord> {
  const { data } = body as { data: Partial<BookingRecord> };
  assert.deepEqual(Object.keys(body as object), ['data']);
  if (data.contact_person) {
    assert.deepEqual(data, { contact_person: bookingDetails.contact_person });
  } else if (data.location) {
    assert.deepEqual(data, {
      location: bookingDetails.location,
      present_location: bookingDetails.present_location,
    });
  } else if (data.children) {
    assert.deepEqual(data, {
      children: bookingDetails.children,
      additional_notes: bookingDetails.additional_notes,
    });
  } else {
    assert.deepEqual(Object.keys(data), ['time_slots']);
    assert.ok(Array.isArray(data.time_slots));
    assert.equal(new Set(data.time_slots).size, data.time_slots.length);
    for (const documentId of data.time_slots) {
      assert.ok(state.timeSlots.some((slot) => slot.documentId === documentId));
    }
  }
  return data;
}

// This first-party HTTP fixture implements only the exercised Strapi wire contract.
// Verification links stand in for supplied emails; no mail delivery is simulated or proved.
export async function startHttpBackend(
  scenario: BookingScenario,
  frontendOrigin: string,
): Promise<HttpBackend> {
  const state = cloneScenario(scenario);
  const requests: RecordedRequest[] = [];
  const violations: string[] = [];
  const verificationLinks: string[] = [];
  const timeSlots = state.timeSlots.map((slot, index) => ({ ...slot, id: index + 101 }));
  state.config.base_url = frontendOrigin;

  const server = createServer(async (request, response) => {
    const url = new URL(request.url!, 'http://127.0.0.1');
    const entry: RecordedRequest = {
      method: request.method!,
      path: url.pathname,
      query: url.search,
      headers: request.headers,
      body: undefined,
      status: 500,
    };
    requests.push(entry);
    response.setHeader('Access-Control-Allow-Origin', frontendOrigin);
    response.setHeader('Vary', 'Origin');

    try {
      const chunks: Buffer[] = [];
      for await (const chunk of request) chunks.push(Buffer.from(chunk));
      const rawBody = Buffer.concat(chunks).toString();
      entry.body = rawBody ? JSON.parse(rawBody) : undefined;
      assert.equal(request.headers.origin, frontendOrigin);

      const documentId = state.bookings[0]?.documentId ?? HTTP_BOOKING_ID;
      const bookingPath = `/api/bookings/${documentId}`;
      const routes: Record<string, string[]> = {
        '/api/config': ['GET'],
        '/api/time-slots': ['GET'],
        '/api/bookings': ['POST'],
        [bookingPath]: ['GET', 'PUT'],
        [`${bookingPath}/send-verification-email`]: ['POST'],
      };
      const methods = routes[url.pathname];
      assert.ok(methods, `Unexpected route: ${url.pathname}`);
      const method =
        entry.method === 'OPTIONS'
          ? request.headers['access-control-request-method']
          : entry.method;
      assert.ok(methods.includes(String(method)), `Unexpected method: ${method}`);
      const query = [...url.searchParams.entries()];
      if (url.pathname === '/api/config' || (url.pathname === bookingPath && method === 'GET')) {
        assert.deepEqual(query, [['populate', '*']]);
      } else if (url.pathname === '/api/time-slots') {
        // Both forms retrieve all inventory; relationship filters must fail this contract.
        assert.ok(query.length === 0 || JSON.stringify(query) === '[["populate","*"]]');
      } else {
        assert.deepEqual(query, []);
      }

      if (entry.method === 'OPTIONS') {
        assert.equal(rawBody, '');
        assert.deepEqual(
          String(request.headers['access-control-request-headers'])
            .toLowerCase()
            .split(',')
            .map((header) => header.trim())
            .sort(),
          ['authorization', 'content-type'],
        );
        response.setHeader('Access-Control-Allow-Methods', methods.join(', '));
        response.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
        entry.status = 204;
        response.writeHead(204).end();
        return;
      }

      assert.equal(request.headers.authorization, `Bearer ${HTTP_TOKEN}`);
      assert.equal(request.headers['content-type'], 'application/json');
      let stage: FailureStage;
      let data: Partial<BookingRecord> | undefined;
      if (url.pathname === '/api/config') stage = 'config';
      else if (url.pathname === '/api/time-slots') stage = 'time-slot-fetch';
      else if (entry.method === 'GET') stage = 'booking-fetch';
      else if (url.pathname.endsWith('/send-verification-email')) stage = 'send-verification';
      else {
        data = validatePayload(entry.body, state);
        stage = data.contact_person
          ? 'contact-save'
          : data.location
            ? 'address-save'
            : data.time_slots
              ? 'time-slot-save'
              : 'children-save';
        if (entry.method === 'POST') assert.equal(stage, 'contact-save');
      }
      if (!data) assert.equal(rawBody, '');

      const failureIndex = state.failures?.findIndex((failure) => failure.stage === stage) ?? -1;
      if (failureIndex >= 0) {
        const failure = state.failures![failureIndex];
        if (failure.once) state.failures!.splice(failureIndex, 1);
        const body = failure.error.body as {
          error?: {
            details?: { data?: BookingRecord; meta?: { concurrencyTimeSlotsError?: boolean } };
          };
        };
        let responseBody: unknown = body;
        // The real controller persists its cleaned response before returning 409.
        if (body?.error?.details?.meta?.concurrencyTimeSlotsError) {
          state.bookings[0] = structuredClone(body.error.details.data!);
          responseBody = {
            ...body,
            error: {
              ...body.error,
              details: { ...body.error.details, data: bookingAttributes(state.bookings[0]) },
            },
          };
        }
        entry.status = failure.error.status!.code;
        respond(
          response,
          entry.status,
          responseBody ?? { error: { name: 'ServiceUnavailableError' } },
        );
        return;
      }

      let result: unknown;
      entry.status = 200;
      if (stage === 'config') result = { data: state.config };
      else if (stage === 'time-slot-fetch') {
        result = { data: timeSlots };
      } else if (stage === 'send-verification') {
        assert.ok(state.bookings[0]);
        verificationLinks.push(`${state.config.base_url}/?id=${documentId}`);
        state.bookings[0].email_resend_count = (state.bookings[0].email_resend_count ?? 0) + 1;
        result = { success: true };
      } else {
        if (entry.method === 'POST') {
          assert.equal(state.bookings.length, 0);
          state.bookings.push({
            documentId: HTTP_BOOKING_ID,
            contact_person: bookingDetails.contact_person,
            location: { street: '', house_number: '', zip_code: '', place: '' },
            present_location: '',
            children: [],
            time_slots: [],
            additional_notes: '',
            email_resend_count: 0,
          });
          entry.status = 201;
        }
        assert.ok(state.bookings[0]);
        if (data) Object.assign(state.bookings[0], structuredClone(data));
        const booking = state.bookings[0];
        const attributes = bookingAttributes(booking);
        // Strapi only populates components/relations on the explicit populated GET.
        result = {
          data:
            entry.method === 'GET'
              ? {
                  ...attributes,
                  contact_person: booking.contact_person,
                  location: booking.location,
                  children: booking.children,
                  time_slots: booking.time_slots.map((slot) => {
                    const documentId = typeof slot === 'string' ? slot : slot.documentId;
                    const populatedSlot = timeSlots.find(
                      (candidate) => candidate.documentId === documentId,
                    );
                    assert.ok(populatedSlot);
                    return populatedSlot;
                  }),
                }
              : attributes,
          meta: {},
        };
      }
      respond(response, entry.status, result);
    } catch (error) {
      violations.push(`${entry.method} ${request.url}: ${String(error)}`);
      entry.status = 400;
      respond(response, 400, { error: { name: 'HttpContractViolation', message: String(error) } });
    }
  });

  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  const address = server.address();
  assert.ok(address && typeof address !== 'string');
  return {
    baseUrl: `http://127.0.0.1:${address.port}`,
    state,
    requests,
    violations,
    verificationLinks,
    close: () =>
      new Promise<void>((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
        server.closeAllConnections();
      }),
  };
}
