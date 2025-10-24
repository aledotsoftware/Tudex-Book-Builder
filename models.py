"""
Data models for the Novel Weaver Studio application.
"""

import uuid
from ruamel.yaml.comments import CommentedMap

class Character:
    """Represents a single character in the novel.

    Attributes:
        id (str): A unique identifier for the character.
        name (str): The name of the character.
        description (str): A brief description of the character.
        attributes (CommentedMap): A map of additional character attributes.
    """

    def __init__(self, name, description=""):
        """Initializes a Character instance.

        Args:
            name (str): The name of the character.
            description (str, optional): A brief description of the character.
                Defaults to "".
        """
        self.id = str(uuid.uuid4())
        self.name = name
        self.description = description
        self.attributes = CommentedMap()

    def __repr__(self):
        return f"Character(name={self.name!r}, description={self.description!r})"

class Chapter:
    """Represents a single chapter in the novel.

    Attributes:
        id (str): A unique identifier for the chapter.
        title (str): The title of the chapter.
        summary (str): A brief summary of the chapter.
        content (str): The full text content of the chapter.
        parts (list): A list of text parts that make up the chapter.
        images (list): A list of image file paths associated with the chapter.
    """

    def __init__(self, title, summary=""):
        """Initializes a Chapter instance.

        Args:
            title (str): The title of the chapter.
            summary (str, optional): A brief summary of the chapter. Defaults to "".
        """
        self.id = str(uuid.uuid4())
        self.title = title
        self.summary = summary
        self.content = ""
        self.parts = []
        self.images = []

    def __repr__(self):
        return f"Chapter(title={self.title!r}, summary={self.summary!r})"

class Novel:
    """Represents the entire novel project.

    Attributes:
        id (str): A unique identifier for the novel.
        title (str): The title of the novel.
        description (str): A brief description of the novel.
        characters (list): A list of Character objects.
        chapters (list): A list of Chapter objects.
        project_settings (CommentedMap): A map of project-level settings.
    """

    def __init__(self, title, description=""):
        """Initializes a Novel instance.

        Args:
            title (str): The title of the novel.
            description (str, optional): A brief description of the novel.
                Defaults to "".
        """
        self.id = str(uuid.uuid4())
        self.title = title
        self.description = description
        self.characters = []
        self.chapters = []
        self.project_settings = CommentedMap({
            "genre": "Fantasy",
            "tone": "Adventurous",
            "illustration_style": "Watercolor"
        })

    def __repr__(self):
        return f"Novel(title={self.title!r}, description={self.description!r})"
