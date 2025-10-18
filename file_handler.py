"""
Handles saving and loading of novel projects in the .tls format.
"""

from ruamel.yaml import YAML
from models import Novel, Chapter, Character

def save_novel(novel_instance, filepath):
    """
    Saves a Novel object to a .tls file (YAML format).
    """
    yaml = YAML()
    yaml.register_class(Novel)
    yaml.register_class(Chapter)
    yaml.register_class(Character)

    with open(filepath, 'w') as f:
        yaml.dump(novel_instance, f)

def load_novel(filepath):
    """
    Loads a Novel object from a .tls file (YAML format).
    """
    yaml = YAML()
    yaml.register_class(Novel)
    yaml.register_class(Chapter)
    yaml.register_class(Character)

    with open(filepath, 'r') as f:
        return yaml.load(f)
