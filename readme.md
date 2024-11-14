# PDF Co-Viewer

PDF Co-Viewer is a web application that allows users to upload and view PDF files directly in the browser. And that pdf is broadcasted over the domain anyone who have the access of domain can see the pdf remotly. The application uses PDF.js for rendering PDF files and Tailwind CSS for styling.

## Features

- Upload and view PDF files
- Navigate through PDF pages
- Responsive design using Tailwind CSS
- Broadcast the Pdf over the domain

## Installation

1. Clone the repository:

   ```sh
   git clone https://github.com/yourusername/pdf-co-viewer.git
   cd pdf-co-viewer
   ```

2. Install dependencies:

   ```sh
   npm install
   ```

3. Run Application:

   ```sh
    npm run start
   ```

## Usage

1. Go to http://localhost:3000/
2. Open the all the localhost:3000 tabs to which you want to broadcast your pdf before uploading the file. Remember! do not refresh the tabs after opening them.
3. The firstly open tab will be admin tab and all other tabs will be viewer tabs and all the controls will be enabled only in admin tab.
4. Upload a PDF file using the file input on the admin tab.
5. Use the navigation buttons to move between pages.
6. Controls will be desabled in viewer's tab.

## Project Structure

- `server.js`: The main file which is containing all the backend.
- `index.html`: The main HTML file.
- `script.js`: The JavaScript file handling PDF rendering and navigation.
- `package.json`: Containing all the important libraries which are used in this project.

## Dependencies

- [Tailwind CSS](https://tailwindcss.com/)
- [PDF.js](https://mozilla.github.io/pdf.js/)

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any changes.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
