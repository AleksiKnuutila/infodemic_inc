import re
import json
import sys

prompt = "You are a helpful assistant trained to categorize content."
prompt += f"Categories:{criteria}"
prompt += "Examples:"
for ex in examples:
  prompt += f"Input: {ex['input']}, Category: {ex['category']}\n"
prompt += f"Now categorize the following:\nInput: {item}\nCategory:"


def clean_text(text):
    # Remove HTML comments
    text = re.sub(r'<!--.*?-->', '', text, flags=re.DOTALL)
    # Remove variable setting statements
    text = re.sub(r'\(set:.*?\)', '', text)
    # Remove choice text
    text = re.sub(r'\[\[.*?\]\]', '', text)
    
    # Split into lines and remove empty lines at start and end
    lines = text.split('\n')
    while lines and not lines[0].strip():
        lines.pop(0)
    while lines and not lines[-1].strip():
        lines.pop()
    
    # Preserve empty lines in the middle
    return '\n'.join(lines)

def parse_twee_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as file:
        content = file.read()

    passages = re.split(r'\n:: ', content)
    passages = [p.strip() for p in passages if p.strip()]

    json_data = []

    for passage in passages:
        if passage.startswith('StoryData') or not re.match(r'^\w+', passage):
            continue

        lines = passage.split('\n')
        header = lines[0]
        text = '\n'.join(lines[1:])

        id_match = re.match(r'(\w+)', header)
        id = id_match.group(1) if id_match else None

        if '<!--Section break-->' in text:
            node_type = 'intermediate'
            # Extract mobile and desktop images if present
            mobile_image = re.search(r'\(set: \$mobileImage to "([^"]+)"\)', text)
            desktop_image = re.search(r'\(set: \$desktopImage to "([^"]+)"\)', text)
        else:
            node_type = 'choice'
            mobile_image = None
            desktop_image = None

        choices = re.findall(r'\[\[(.+?)\]\]', text)
        choices_data = []

        for choice in choices:
            if '|' in choice:
                choice_text, next_id = choice.split('|')
            else:
                choice_text = choice
                next_id = choice

            choice_data = {
                "text": choice_text.strip(),
                "next": next_id.strip(),
                "profitChange": 0,
                "legitimacyChange": 0
            }
            choices_data.append(choice_data)

        cleaned_text = clean_text(text)

        # Check for variable changes in the next node
        for choice in choices_data:
            next_node = next((p for p in passages if p.startswith(choice['next'])), None)
            if next_node:
                profit_change = re.search(r'\(set: \$profit to it ([+-] \d+)\)', next_node)
                legitimacy_change = re.search(r'\(set: \$legitimacy to it ([+-] \d+)\)', next_node)
                
                if profit_change:
                    choice['profitChange'] = int(profit_change.group(1).replace(' ', ''))
                if legitimacy_change:
                    choice['legitimacyChange'] = int(legitimacy_change.group(1).replace(' ', ''))

        node_data = {
            "id": id,
            "type": node_type,
            "text": cleaned_text,
            "choices": choices_data
        }

        # Add mobile and desktop images for intermediate nodes if they exist
        if node_type == 'intermediate':
            if mobile_image:
                node_data["mobileImage"] = mobile_image.group(1)
            if desktop_image:
                node_data["desktopImage"] = desktop_image.group(1)

        json_data.append(node_data)

    return json_data

def write_js_file(data, output_file):
    with open(output_file, 'w', encoding='utf-8') as file:
        json.dump(data, file, indent=4, ensure_ascii=False)

def main():
    if len(sys.argv) != 3:
        print("Usage: python script.py <input_twee_file> <output_js_file>")
        sys.exit(1)

    input_file = sys.argv[1]
    output_file = sys.argv[2]

    try:
        json_data = parse_twee_file(input_file)
        write_js_file(json_data, output_file)
        print(f"Conversion successful. JS data written to {output_file}")
    except Exception as e:
        print(f"An error occurred: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()
