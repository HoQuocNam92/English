"""Run with python3 scripts/ubuntu/test_learning_reminders.py (no third-party packages)."""
import fcntl
import subprocess
import tempfile
import threading
import unittest
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

RUNNER = Path(__file__).with_name('run-learning-reminders.sh')
KEY = 'test-key-' + 'a' * 40

class Handler(BaseHTTPRequestHandler):
    def do_POST(self):
        self.server.requests += 1
        self.server.last_path = self.path
        self.server.last_body = self.rfile.read(int(self.headers.get('Content-Length', 0)))
        code = self.server.response_code if self.headers.get('x-scheduler-key') == KEY else 401
        self.send_response(code)
        self.end_headers()
        self.wfile.write(b'{"created":1}')

    def log_message(self, *_):
        pass

class ReminderRunnerTests(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory()
        self.server = ThreadingHTTPServer(('127.0.0.1', 0), Handler)
        self.server.requests = 0
        self.server.response_code = 200
        self.thread = threading.Thread(target=self.server.serve_forever, daemon=True)
        self.thread.start()
        self.config = Path(self.directory.name) / 'reminders.curl'
        self.lock = Path(self.directory.name) / 'reminders.lock'
        self.configure(KEY)

    def configure(self, key):
        port = self.server.server_address[1]
        self.config.write_text(f'url = "http://127.0.0.1:{port}/api/v1/internal/jobs/learning-reminders"\nheader = "x-scheduler-key: {key}"\n')
        self.config.chmod(0o600)

    def run_job(self):
        result = subprocess.run(['bash', str(RUNNER), str(self.config), str(self.lock)], capture_output=True, text=True, timeout=10)
        self.assertNotIn(KEY, result.stdout + result.stderr)
        return result

    def tearDown(self):
        self.server.shutdown()
        self.server.server_close()
        self.thread.join()
        self.directory.cleanup()

    def test_authenticated_post(self):
        self.assertEqual(self.run_job().returncode, 0)
        self.assertEqual(self.server.requests, 1)
        self.assertEqual(self.server.last_path, '/api/v1/internal/jobs/learning-reminders')
        self.assertEqual(self.server.last_body, b'{}')

    def test_wrong_key_fails(self):
        self.configure('wrong-key')
        self.assertNotEqual(self.run_job().returncode, 0)

    def test_api_error_fails(self):
        self.server.response_code = 503
        self.assertNotEqual(self.run_job().returncode, 0)

    def test_public_configuration_is_rejected_before_request(self):
        self.config.chmod(0o644)
        self.assertNotEqual(self.run_job().returncode, 0)
        self.assertEqual(self.server.requests, 0)

    def test_missing_config_fails(self):
        self.config.unlink()
        self.assertNotEqual(self.run_job().returncode, 0)
        self.assertEqual(self.server.requests, 0)

    def test_concurrent_run_skips_request(self):
        with self.lock.open('w') as handle:
            fcntl.flock(handle, fcntl.LOCK_EX | fcntl.LOCK_NB)
            self.assertEqual(self.run_job().returncode, 0)
            self.assertEqual(self.server.requests, 0)

if __name__ == '__main__':
    unittest.main()
