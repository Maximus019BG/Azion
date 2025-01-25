[![License](https://img.shields.io/badge/License-GPL_v3-teal)](https://github.com/Maximus019BG/Azion/blob/master/LICENSE)
![Azion](https://maximus019bg.github.io/TopVideoGames/Azion.png)

# Azion

**Azion** is a comprehensive management application designed to help organizations manage their tasks, projects, and sensitive information securely.

## Table of Contents
- [Features](#features)
- [Platforms](#platforms)
- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)
- [Authors](#authors)

## Features
- **Data Access Control**: Ensure that only authorized users can access sensitive information.
- **Role-Based Management**: Assign roles to users and manage permissions effectively.
- **Multi-Platform App**: Available on multiple platforms including Windows, Linux, Web, and Android.
- **Security**: Advanced security features to protect your data.
- **MFA with Face Recognition**: Multi-factor authentication using face recognition.
- **Role-Based Data Access**: Control data access based on user roles.
- **Stats and Analytics**: Get insights and analytics on your data.
- **Task Management**: Manage tasks and projects effectively.
- **Meeting Management**: Schedule and manage meetings with ease.
- **Organization Building Activities Monitoring**: Monitor and manage organization building activities (room access adn more).

## Platforms
- **Windows**
- **Linux (Debian-Based Distributions)**
- **Web (Chromium, Firefox, Edge)**
- **Android**

> [!Note] 
> - *MAC OS* and *Chrome OS* are **NOT** supported by the *desktop app*.
> - **Other** Linux distributions are not supported by the *desktop app*.
> - The *Azion mobile app* is not made for *iOS*.
> - The *desktop app* is tested on **Windows 11** not **Ubuntu**.

## Installation
### Prerequisites
- **Node.js** and **npm**: Ensure you have Node.js and npm installed.
- **Java**: Ensure you have Java installed for the backend services.
- **Maven**: Ensure you have Maven installed for building the Java projects.
- **Docker**: Ensure you have Docker installed for running the backend services.

### Steps for running the app
1. **Clone the repository**:
    ```sh
    git clone https://github.com/Maximus019BG/Azion.git
    cd Azion
    ```

2. **Set up environment variables**:
    Create a `.env` file in the `/server` directory and add the following variables:
    ```dotenv
    #.env example
    DB_URL="jdbc:mysql://aziondb:3306/aziondb"
    DB_USERNAME="root"
    DB_PASSWORD="root"
    SECRET_JWT="ASDGHAFGaF@#ejsafu7@43kjahsf&@YAJSFK@Y&UHfusa*@FSAFjasf"
    ISSUER_NAME="Azion"
    SECRET_MFA="GHAFGaF@#ejsafu7@43kjafusa*@FSAFjasf"
    DB_NAME="database name"
    OS="Linux"
    EMAIL="random@email.com"
    EMAIL_PASSWORD="password"
    REQUEST_ORIGIN="http://localhost:3000"
    REQUEST_ORIGIN_MOBILE="http://AzionMobile:3000"
    VIRUS_TOTAL_API_KEY="API_KEY"
    SENDGRID_API_KEY="Different_API_KEY"

    ```

3. **Install frontend dependencies**:
    ```sh
    cd client
    npm install
    ```

4. **Build the frontend**:
    ```sh
    npm run build
    ```
    
5. **Start the frontend**:
    ```sh
    npm start
    ```

6. **Start the backend services**:
    ```sh
    cd ../server
    docker-compose up --build
    ```
    
## Contributing
We welcome contributions from the community! To contribute to Azion, please first read the [CONTRIBUTING.md](https://github.com/Maximus019BG/Azion/blob/dev/CONTRIBUTING.md) file.

## License
This task is licensed under the GPL v3 License - see the [LICENSE](https://github.com/Maximus019BG/Azion/blob/master/LICENSE) file for details.

## Authors
- [@Maximus019](https://github.com/Maximus019BG)
- [@SimoSabev](https://github.com/SimoSabev)

## Contact
For any inquiries or support, please contact us at [aziononlineteam@gmail.com](mailto:aziononlineteam@gmail.com).
