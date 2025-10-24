import unittest
from generator import slugify

class TestGenerator(unittest.TestCase):
    def test_slugify_handles_non_alphanumeric_input(self):
        """
        Tests that the slugify function does not return an empty string
        when given only non-alphanumeric characters.
        """
        result = slugify("???!")
        self.assertNotEqual(result, "", "slugify should not return an empty string")

if __name__ == '__main__':
    unittest.main()
