# 🚀 Getting started with KjG Nikolaus Buchung

In the Strapi backend `Content Manager` -> `Single Types` -> `Config` configure the basic configuration:

- `api_token`: see below how to create an [API Token](#-create-an-api-token)
- `base_url`: this is the web URL for the tool and is used for link generation in emails
- `api_base_url`: this is the API URL the frontend will use to make API calls
- `max_time_slots`: this is the number of concurrent reservations per available slot booking
  - Example:
    - A Time-slot from `17:00-17:30` has `max_bookings = 4` (there are 4 Nikolaus, they can visit 4 families in parallel at the same time)
    - `max_time_slots = 3` means that for every Time-slot for every booking there can be 3 reservations
    - That means the Time-slot `17:00-17:30` can be reserved by `4 * 3 = 12` bookings. This seems strange but let me explain.
    - Now we have `12` reservations for the Time-Slot `17:00-17:30` but each of the reservation has another `2` reservations of other Time-slots, that means that every reservation only takes `1/3 (one third)` of a single booking. Let's say it in other words: each reservation has reserved 3 Time-slots but needs only 1 of them.
    - Therefore if every family has reserved 3 Time-slots it is possible to assign each family one Time-slot and optimize the route of each Nikolaus at least a bit, by switching around the Time-slots between the families.
    - In rare cases there might be a constellation where the last family maybe cannot select 3 Time-slots anymore, then it can be possible that this family does not get any Time-slot and gets no visit by the Nikolaus. But this only happens if the sum of `max_bookings` of all Time-slots can not be divided by `max_time_slots`.
  - In 2024 we testet the tool with `max_time_slots = 3`
- `show_search_for_time_slots`: if there are many Time-slots you can enable the search box for them
- Deadlines
  - Example for 2024: Nikolaus visits are planned for 5. and 6. December
  - `route_planning_deadline`: a good value is one week before the first Nikolaus visit will happen (so for 2024 we used: `27.11.2024 23:59`)
  - `final_deadline`: a good value is one week before the first Nikolaus visit will happen (so for 2024 we used: `01.12.2024 23:59`)
- `privacy_policy_link`: [optional] enter a link to a privacy policy (i. e. `https://kjg-bad-abbach.de/datenschutz/`)
- `legal_notice_link`: [optional] enter a link to a legal notice / imprint / Impressum (i. e. `https://kjg-bad-abbach.de/impressum/`)
- `introduction_text`: [optional] here you can enter an introduction that is shown for the users without a booking yet, for example:
  ```
  Ho Ho Ho

  Auch dieses Jahr kommt der Nikolaus wieder! Am 5. und 6. Dezember 2024 jeweils ab 17:30 Uhr fliegen er und seine Engel zu euch nach Hause. Natürlich auf Spendenbasis. Alle Spenden fließen zu 100% in die Kinder- und Jugendarbeit der KjG Bad Abbach.

  In der Adventszeit ist es Tradition, dass der heilige Nikolaus Kinder besucht und Lob und Tadel aus seinem goldenen Buch vorliest. Als KjG bieten wir diesen Nikolausdienst für Familien an. Der Nikolaus erhält im Vorfeld Informationen zu den Kindern, sodass das goldene Buch individuell gefüllt werden kann. Eine solche Information sollte den Namen, ein eindeutiges Identifikationsmerkmal sowie Lob und ggf. Tadel enthalten. Ebenso wird im Vorfeld mitgeteilt, wo sich die Geschenke befinden.

  Der Besuch dauert in etwa 10-20 Minuten. Bitte erwarte in dieser kurzen Zeit keine pädagogischen Wunder. Nutze die Gelegenheit deine Kinder zu loben und einen oder maximal zwei Verbesserungsimpulse zu geben. Unser Nikolaus hat immer einen Engel dabei, die Buchung eines Krampus oder Knecht Rupprecht ist nicht möglich.

  Wenn alle Informationen erfolgreich eingetragen wurden, dann steht einem erfolgreichen Nikolaus-Besuch nichts mehr im Wege und ihr bekommt im Schritt 'Kontrolle' eine entsprechende Meldung mit einem grünen Haken.
  ```
- Verification Email
  - Once the contact details are filled out and saved to the server, the user will get an email to verify their email address and to get the personal link to edit the booking at any time.
  - `verification_email_subject_template`: enter the subject for that verification email (i. e. `E-Mail verifiziert - Vervollständige deine Buchung`)
  - `verification_email_body_template`: enter the body for that verification email, for example:
    ```
    E-Mail erfolgreich verifiziert!

    Hallo {{first_name}} {{last_name}},

    vielen Dank für die Verifizierung deiner E-Mail-Adresse. Du kannst jetzt deine Buchung vervollständigen, indem du alle erforderlichen Informationen eingibst.

    Nutze den untenstehenden Link, um deine Buchung jederzeit aufzurufen, zu überprüfen und zu bearbeiten:

    {{button('Buchung vervollständigen/bearbeiten')}}

    Bitte stelle sicher, dass du alle erforderlichen Felder für eine erfolgreiche Buchung ausfüllst.

    Deine KjG Bad Abbach.
    ```
  - Possible placeholders are:
    - `{{subject}}` (not available for `verification_email_subject_template`)
    - `{{button('Some text for the button')}}` (not available for `verification_email_subject_template`)
    - `{{booking_url}}`
    - `{{first_name}}`
    - `{{last_name}}`
    - `{{phone_number}}`
    - `{{email}}`

## ⏰ Create the Time-slots

- `start`: the start time of the Time-slot
- `end`: the end time of the Time-slot
- `max_bookings`: the maximum number of bookings allowed for this Time-slot, this is the number of Nikolauses that can visit families at this specific Time-slot in parallel

### Using the Strapi backend

Create the Time-slots using the Strapi backend `Content Manager` -> `Collection Types` -> `Time Slot`.

### Using HTTP-POST requests

Create an [API Token](#-create-an-api-token) that is allowed to create Time-slots. A token with this rights must not be used for the API Token in the Config, so be careful who can create the Time-slots.

Then send the HTTP-POST requests to the server. Keep in mind that the timestamp with `...Z` uses the universal UTC timezone and you must convert it to your timezone i. e. Europe/Berlin. During conversion keep in mind, that we have a timezone switch from summer to winter in October, so the time-offset at your current time may not apply in December.

- `start`: the start time of the Time-slot is in ISO 8601 format (YYYY-MM-DDTHH:MM:SS.SSSZ), for example: `2024-12-05T19:30:00.000Z`
- `end`: the end time of the Time-slot is in ISO 8601 format (YYYY-MM-DDTHH:MM:SS.SSSZ), for example: `2024-12-05T20:00:00.000Z`

```rest
POST http://localhost:1337/api/time-slots
Authorization: Bearer {{$dotenv REST_API_TOKEN}}
Content-Type: application/json

{
    "data": {
        "start": "2024-12-05T19:30:00.000Z",
        "end": "2024-12-05T20:00:00.000Z",
        "max_bookings": 3
    }
}
```

## 🔑 Create an API Token

Generate an API token with the following rights under `Settings` -> `Global Settings` -> `API Tokens` -> `New`
- `Token type`: `Custom`
- `Permissions` for `Config`:
  - `find`
- `Permissions` for `Booking`:
  - `sendVerificationEmail`
  - `create`
  - `update`
  - `findOne`
- `Permissions` for `Time-slot`:
  - `find`
  - `findOne`
