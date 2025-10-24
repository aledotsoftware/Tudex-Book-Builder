"""
The main graphical user interface for the Novel Weaver Studio application.
"""
import toga
from toga.style import Pack
from toga.style.pack import COLUMN, ROW
from models import Novel
from file_handler import save_novel, load_novel

class NovelWeaverStudio(toga.App):
    """The main application class for Novel Weaver Studio.

    This class encapsulates the main window, UI components, and the logic for
    handling user interactions in the Novel Weaver Studio application.
    """

    def startup(self):
        """Initializes the application, creates the main window, and sets up the UI.

        This method is called by Toga when the application starts. It sets up the
        initial state of the application, creates the main window, and builds the
        three-column UI layout.
        """
        self.current_novel = None
        self.current_filepath = None

        # Create the main containers
        self.main_box = toga.Box(style=Pack(direction=COLUMN))

        # Left Column (Navigation)
        self.structure_tree = toga.Tree(
            headings=["Estructura"],
            style=Pack(flex=1)
        )
        self.left_container = toga.Box(style=Pack(direction=COLUMN, padding=5))
        self.left_container.add(self.structure_tree)

        # Right Column (Contextual Tools)
        self.right_container = toga.Box(style=Pack(direction=COLUMN, padding=5))
        self.right_container.add(toga.Label("Catálogos y Herramientas"))

        # Center Column (Main Editor)
        self.editor_input = toga.MultilineTextInput(style=Pack(flex=1, padding=5))
        self.center_container = toga.Box(style=Pack(direction=COLUMN))
        self.center_container.add(self.editor_input)

        # Create SplitContainers for the three-column layout
        right_split = toga.SplitContainer(content=[self.center_container, self.right_container])
        main_split = toga.SplitContainer(content=[self.left_container, right_split])

        # Add commands to the app
        self.commands.add(
            toga.Command(self.open_file, "Abrir", shortcut=toga.Key.MOD_1 + 'o'),
            toga.Command(self.save_file, "Guardar", shortcut=toga.Key.MOD_1 + 's'),
            toga.Command(self.save_file_as, "Guardar Como...", shortcut=toga.Key.MOD_1 + toga.Key.SHIFT + 's'),
            toga.Command(self.new_novel, "Nuevo Proyecto", shortcut=toga.Key.MOD_1 + 'n')
        )

        # Add the main layout to the window
        self.main_window = toga.MainWindow(title=self.formal_name)
        self.main_window.content = main_split
        self.main_window.show()

    def update_ui_with_novel_data(self):
        """Updates the UI to reflect the current state of the loaded novel.

        This method populates the navigation tree and the main editor with data
        from the `self.current_novel` object. If no novel is loaded, it clears
        the UI components.
        """
        if self.current_novel:
            self.main_window.title = f"{self.formal_name} - {self.current_novel.title}"
            self.editor_input.value = self.current_novel.description

            # Populate the structure tree
            self.structure_tree.data.clear()
            root = self.structure_tree.data.append(self.current_novel.title)

            chapters_node = root.append("Capítulos")
            for chapter in self.current_novel.chapters:
                chapters_node.append(chapter.title)

            characters_node = root.append("Personajes")
            for character in self.current_novel.characters:
                characters_node.append(character.name)
        else:
            self.main_window.title = self.formal_name
            self.editor_input.value = ""
            self.structure_tree.data.clear()

    async def new_novel(self, widget):
        """Handles the 'Nuevo Proyecto' command.

        This method prompts the user for a title for a new novel. If a title is
        provided, it creates a new `Novel` object and updates the UI.

        Args:
            widget: The widget that triggered the command.
        """
        title = await self.main_window.text_input_dialog("Nuevo Proyecto", "Introduce el título de la novela:")
        if title:
            self.current_novel = Novel(title=title)
            self.current_filepath = None
            self.update_ui_with_novel_data()
            self.main_window.info_dialog("Proyecto Creado", f"Nuevo proyecto '{title}' creado.")

    async def open_file(self, widget):
        """Handles the 'Abrir' command.

        This method displays an open file dialog, allowing the user to select a
        `.tls` file. If a file is selected, it is loaded using the `load_novel`
        function and the UI is updated.

        Args:
            widget: The widget that triggered the command.
        """
        try:
            filepath = await self.main_window.open_file_dialog("Abrir Novela", file_types=['tls'])
            if filepath:
                self.current_novel = load_novel(filepath)
                self.current_filepath = filepath
                self.update_ui_with_novel_data()
                self.main_window.info_dialog("Éxito", f"Novela '{self.current_novel.title}' cargada.")
        except Exception as e:
            self.main_window.error_dialog("Error", f"No se pudo cargar el archivo: {e}")

    async def save_file(self, widget):
        """Handles the 'Guardar' command.

        This method saves the current novel to its existing file path. If the
        novel has not been saved before, it calls the `save_file_as` method.

        Args:
            widget: The widget that triggered the command.
        """
        if self.current_novel:
            # Update the description from the editor before saving
            self.current_novel.description = self.editor_input.value
            if self.current_filepath:
                try:
                    save_novel(self.current_novel, self.current_filepath)
                    self.main_window.info_dialog("Éxito", "Novela guardada.")
                except Exception as e:
                    self.main_window.error_dialog("Error", f"No se pudo guardar el archivo: {e}")
            else:
                await self.save_file_as(widget)
        else:
            self.main_window.info_dialog("Información", "No hay ninguna novela activa para guardar.")

    async def save_file_as(self, widget):
        """Handles the 'Guardar Como...' command.

        This method displays a save file dialog, allowing the user to choose a
        location to save the current novel.

        Args:
            widget: The widget that triggered the command.
        """
        if self.current_novel:
            # Update the description from the editor before saving
            self.current_novel.description = self.editor_input.value
            try:
                filepath = await self.main_window.save_file_dialog("Guardar Novela Como", suggested_filename=f"{self.current_novel.title}.tls", file_types=['tls'])
                if filepath:
                    self.current_filepath = filepath
                    save_novel(self.current_novel, self.current_filepath)
                    self.main_window.info_dialog("Éxito", f"Novela guardada en {filepath}.")
            except Exception as e:
                self.main_window.error_dialog("Error", f"No se pudo guardar el archivo: {e}")
        else:
            self.main_window.info_dialog("Información", "No hay ninguna novela activa para guardar.")

def main():
    """The main entry point for the application."""
    return NovelWeaverStudio('Novel Weaver Studio', 'org.example.novelweaverstudio')

if __name__ == '__main__':
    main().main_loop()
