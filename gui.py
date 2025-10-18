"""
The main graphical user interface for the Novel Weaver Studio application.
"""
import toga
from toga.style import Pack
from toga.style.pack import COLUMN, ROW
from models import Novel
from file_handler import save_novel, load_novel

class NovelWeaverStudio(toga.App):
    """The main application class for Novel Weaver Studio."""
    def startup(self):
        """Initializes the application, creates the main window, and sets up the UI."""
        self.current_novel = None
        self.current_filepath = None

        # Create the main containers
        self.main_box = toga.Box(style=Pack(direction=COLUMN))

        # Left Column (Navigation)
        left_container = toga.Box(style=Pack(direction=COLUMN, padding=5))
        left_container.add(toga.Label("Navegación y Estructura"))

        # Right Column (Contextual Tools)
        right_container = toga.Box(style=Pack(direction=COLUMN, padding=5))
        right_container.add(toga.Label("Catálogos y Herramientas"))

        # Center Column (Main Editor)
        center_container = toga.Box(style=Pack(direction=COLUMN, padding=5))
        center_container.add(toga.Label("Editor Principal"))

        # Create SplitContainers for the three-column layout
        right_split = toga.SplitContainer(content=[center_container, right_container])
        main_split = toga.SplitContainer(content=[left_container, right_split])

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

    async def new_novel(self, widget):
        """Handles the 'Nuevo Proyecto' command."""
        title = await self.main_window.text_input_dialog("Nuevo Proyecto", "Introduce el título de la novela:")
        if title:
            self.current_novel = Novel(title=title)
            self.current_filepath = None
            # TODO: Update the UI to reflect the new novel
            self.main_window.info_dialog("Proyecto Creado", f"Nuevo proyecto '{title}' creado.")

    async def open_file(self, widget):
        """Handles the 'Abrir' command."""
        try:
            filepath = await self.main_window.open_file_dialog("Abrir Novela", file_types=['tls'])
            if filepath:
                self.current_novel = load_novel(filepath)
                self.current_filepath = filepath
                # TODO: Update the UI with the loaded novel's data
                self.main_window.info_dialog("Éxito", f"Novela '{self.current_novel.title}' cargada.")
        except Exception as e:
            self.main_window.error_dialog("Error", f"No se pudo cargar el archivo: {e}")

    async def save_file(self, widget):
        """Handles the 'Guardar' command."""
        if self.current_novel:
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
        """Handles the 'Guardar Como...' command."""
        if self.current_novel:
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
