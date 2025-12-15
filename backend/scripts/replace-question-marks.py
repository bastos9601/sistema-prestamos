import re
import os

def replace_question_marks_in_line(line):
    """Reemplaza ? por $1, $2, $3, etc. en una línea"""
    if '?' not in line:
        return line
    
    counter = [1]  # Usar lista para mantener referencia mutable
    
    def replacer(match):
        result = f'${counter[0]}'
        counter[0] += 1
        return result
    
    return re.sub(r'\?', replacer, line)

def process_file(filepath):
    """Procesa un archivo reemplazando ? por $1, $2, etc."""
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    modified = False
    new_lines = []
    in_query = False
    query_lines = []
    
    for line in lines:
        if 'pool.query' in line:
            in_query = True
            query_lines = [line]
        elif in_query:
            query_lines.append(line)
            if line.count(')') > line.count('('):
                # Fin del query
                query_text = ''.join(query_lines)
                if '?' in query_text:
                    # Contar paréntesis para saber dónde termina
                    modified_query = replace_question_marks_in_line(query_text)
                    new_lines.append(modified_query)
                    modified = True
                else:
                    new_lines.extend(query_lines)
                in_query = False
                query_lines = []
        else:
            new_lines.append(line)
    
    if modified:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.writelines(new_lines)
        return True
    return False

# Procesar todos los controladores
controllers_dir = '../src/controllers'
for filename in os.listdir(controllers_dir):
    if filename.endswith('.js'):
        filepath = os.path.join(controllers_dir, filename)
        if process_file(filepath):
            print(f'✅ {filename} - Modificado')
        else:
            print(f'⏭️  {filename} - Sin cambios')

print('\n🎉 Completado')
