import serial.tools.list_ports

def get_serial_ports():
    """
    Returns a list of available serial ports.

    Returns:
        list: A list of ListPortInfo objects.
    """
    return serial.tools.list_ports.comports()