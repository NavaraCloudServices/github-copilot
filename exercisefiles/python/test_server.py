import pytest
import requests
import subprocess
import time
import os
import signal

# Global variable to store the server process
server_process = None

def setup_module(module):
    """Start server.py before all tests"""
    global server_process
    server_process = subprocess.Popen(['python3', 'server.py'])
    time.sleep(2)  # Wait for server to start

def teardown_module(module):
    """Stop server.py after all tests"""
    global server_process
    if server_process:
        server_process.terminate()
        server_process.wait()

def test_name_not_passed():
    response = requests.get('http://localhost:3000/hello')
    assert response.text == 'name not passed'

def test_name_passed():
    response = requests.get('http://localhost:3000/hello?name=world')
    assert response.text == 'hello world'
