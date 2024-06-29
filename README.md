# Annual Project (NPRG045)
## Web Application for Sensor Communication

### Project Overview

This project aims to develop a web application that communicates with a sensor connected via a COM port. The application allows users to perform measurements (e.g., distance) and log results into a database. Key features include:

- Connecting to a sensor via a COM port
- Real-time display of measured data
- Logging results into a database
- Reviewing logged measurements

[Detailed Project Specification in Czech](./docs/program_specification_cz.md)

## Technologies Used

### Frontend
- Vite + React
- TypeScript
- Reactstrap

### Backend
- Python
- Django
- SQLite3 (upgradeable to MySQL)
- Neural Network for future data processing

### Communication Protocols

- **REST API:** For frontend-backend communication, primarily for accessing logs.
- **Web Serial API:** For connecting the frontend to the sensor via the COM port.
- **MQTT:** For bidirectional communication between the sensor and the application.

## Installation TBD

## Usage TBD

## Contact

For any questions or feedback, please contact [j3.zelenka@gmail.com](mailto:j3.zelenka@gmail.com).
