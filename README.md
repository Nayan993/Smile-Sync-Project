# Smile-Sync-Project
I have created this project by watching major flaws in my college attendance system which is as obvious manual so I have created this project to take attendance automatically via wifi/wired cams and mark it in csv file as per the date.
SmileSync Check-In is web app powered by Flask, Python, and JavaScript. Utilizing advanced computer vision, it redefines attendance management. With a user-friendly interface and facial recognition, attendees smile for the camera, and data is securely stored in CSV files. Simplifying attendance tracking, it enhances efficiency for educational institutions and organizations.

Setup Process

things you need to do first is to copy code from GitHub, create Python virtual enviroment, download Python dependencies, and install JavaScript dependencies from the terminal:

Clone the GitHub Repository:

Open your terminal.

Change to the directory where you want to clone the repository using the cd command.

Use the git clone command to clone the GitHub repository. For example:

git clone 

Setup Python environment for your SmileSync Check-In web app, you can create a virtual environment. Virtual environments are recommended to keep your project's dependencies separate from the system-wide Python installation. Here are the steps:

-> Navigate to Your Project Directory: Open your terminal and navigate to the directory where your SmileSync Check-In project is located. You can use the cd command to change directories.

cd /path/to/your/project

-> Create a Virtual Environment: Use the following command to create a virtual environment. Replace venv with the name you want to give to your virtual environment:

python -m venv venv

-> Activate the Virtual Environment: On macOS and Linux, use this command:

source venv/bin/activate

On Windows, use this command:

venv\Scripts\activate

Your terminal prompt should change, indicating that the virtual environment is active.

Download Python Dependencies:

Change to the directory where you cloned the repository using the cd command.

Use python or python3 with pip to install the Python dependencies from the requirements.txt file. Execute the following command:

pip install -r requirements.txt

Install JavaScript Dependencies:

Make sure you have Node.js and npm (Node Package Manager) installed.

Change to the directory where you cloned the repository using the cd command if you're not already there.

Use npm to install the JavaScript dependencies from the package.json file. Execute the following command:

npm install

You should now have all the required Python and JavaScript dependencies installed in your project folder.

You can add faces for attendance in "known_faces" folder

open terminal in the SmileSync directory and run the flask app - "app.py" using command:

flask run --app app.py

This command will start the Flask development server, and your app will be available at the default address http://127.0.0.1:5000/. You can access it in your web browser by visiting this address.
