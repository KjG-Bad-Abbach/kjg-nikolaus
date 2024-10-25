import type { Struct, Schema } from '@strapi/strapi';

export interface SharedContactPerson extends Struct.ComponentSchema {
  collectionName: 'components_shared_contact_people';
  info: {
    displayName: 'Contact Person';
    icon: 'user';
    description: '';
  };
  attributes: {
    first_name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 50;
      }>;
    last_name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 50;
      }>;
    phone_number: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 50;
      }>;
    email: Schema.Attribute.Email &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 100;
      }>;
  };
}

export interface SharedAddress extends Struct.ComponentSchema {
  collectionName: 'components_shared_addresses';
  info: {
    displayName: 'Address';
    icon: 'pinMap';
    description: '';
  };
  attributes: {
    street: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 100;
      }>;
    house_number: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 10;
      }>;
    zip_code: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 5;
        maxLength: 5;
      }>;
    place: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 100;
      }>;
  };
}

export interface BookingChild extends Struct.ComponentSchema {
  collectionName: 'components_booking_children';
  info: {
    displayName: 'Child';
    icon: 'walk';
  };
  attributes: {
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 50;
      }>;
    speech: Schema.Attribute.Text;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'shared.contact-person': SharedContactPerson;
      'shared.address': SharedAddress;
      'booking.child': BookingChild;
    }
  }
}
