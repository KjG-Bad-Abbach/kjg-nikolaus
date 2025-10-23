import json
import csv

# Load the JSON data
with open('data.json') as f:
    data = json.load(f)

# Open a CSV file in write mode
with open('data.csv', 'w', newline='') as f:
    writer = csv.writer(f)

    # Write the header
    # columns = [
    #     'documentId',
    #     'contact_person.first_name',
    #     'contact_person.last_name',
    #     '=contact_person.phone_number',
    #     'contact_person.email',
    #     'location.street',
    #     'location.house_number',
    #     '=location.zip_code',
    #     'location.place',
    #     'present_location',
    #     'additional_notes',
    #     'time_slots[0].start',
    #     # 'time_slots[0].end',
    #     'time_slots[1].start',
    #     # 'time_slots[1].end',
    #     'time_slots[2].start',
    #     # 'time_slots[2].end',
    # ]
    columns = [
        'documentId',
        'contact_person.first_name',
        'contact_person.last_name',
        '=contact_person.phone_number',
        'contact_person.email',
        'location.street',
        'location.house_number',
        '=location.zip_code',
        'location.place',
        'present_location',
        'additional_notes',
        'children[0].name',
        'children[0].identification_trait',
        'children[0].speech',
        'children[1].name',
        'children[1].identification_trait',
        'children[1].speech',
        'children[2].name',
        'children[2].identification_trait',
        'children[2].speech',
        'children[3].name',
        'children[3].identification_trait',
        'children[3].speech',
        'children[4].name',
        'children[4].identification_trait',
        'children[4].speech',
        'children[5].name',
        'children[5].identification_trait',
        'children[5].speech',
        'children[6].name',
        'children[6].identification_trait',
        'children[6].speech',
        'children[7].name',
        'children[7].identification_trait',
        'children[7].speech',
        'children[8].name',
        'children[8].identification_trait',
        'children[8].speech',
        'children[9].name',
        'children[9].identification_trait',
        'children[9].speech',
        'children[10].name',
        'children[10].identification_trait',
        'children[10].speech',
        'children[11].name',
        'children[11].identification_trait',
        'children[11].speech',
        'children[12].name',
        'children[12].identification_trait',
        'children[12].speech',
        'children[13].name',
        'children[13].identification_trait',
        'children[13].speech',
        'children[14].name',
        'children[14].identification_trait',
        'children[14].speech',
        'children[15].name',
        'children[15].identification_trait',
        'children[15].speech',
    ]
    headers = [column.lstrip('=') for column in columns]
    writer.writerow(headers)

    # Write the data
    for row in data:
        dataCols = []
        for column in columns:
            import re

            def get_nested_value(obj, path):
                if obj is None:
                    return None
                match = re.match(r'(\w+)\[(\d+)\](.*)', path)
                if match:
                    key, index, rest = match.groups()
                    if key in obj and int(index) < len(obj[key]):
                        value = obj[key][int(index)]
                        if rest:
                            rest = rest.lstrip('.')
                            return get_nested_value(value, rest)
                        else:
                            return value
                    else:
                        return None
                else:
                    match = re.match(r'(\w+)\.(.*)', path)
                    if match:
                        key, rest = match.groups()
                        if key in obj:
                            return get_nested_value(obj[key], rest)
                        else:
                            return None
                    else:
                        if path in obj:
                            return obj[path]
                        else:
                            return None

            prefix = None
            if column.startswith('='):
                prefix = "="
                column = column[1:]
            dataCol = get_nested_value(row, column)
            if prefix:
                # dataCol = prefix + "'" + str(dataCol) + "'"
                dataCol = prefix + '"' + str(dataCol) + '"'
            if dataCol:
                try:
                    from datetime import datetime
                    from pytz import timezone
                    dataCol = datetime.strptime(dataCol, '%Y-%m-%dT%H:%M:%S.%fZ').replace(tzinfo=timezone('UTC')).astimezone(timezone('Europe/Berlin')).strftime('%Y-%m-%d %H:%M:%S')
                except ValueError:
                    pass
            dataCols.append(dataCol)
        writer.writerow(dataCols)
