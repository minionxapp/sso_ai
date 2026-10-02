import http from 'k6/http';
import { check, sleep } from 'k6';

// Kriteria Selesai: latensi otentikasi tetap di bawah 300ms pada beban puncak
export const options = {
  stages: [
    { duration: '10s', target: 50 }, // Ramp-up to 50 users
    { duration: '30s', target: 50 }, // Stay at 50 users for 30s
    { duration: '10s', target: 0 },  // Ramp-down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<300'], // 95% of requests must complete below 300ms
  },
};

export default function () {
  const payload = JSON.stringify({
    username: 'testuser',
    password: 'testpassword123',
  });

  const headers = { 'Content-Type': 'application/json' };

  const res = http.post('http://localhost:3000/api/auth/login', payload, { headers });

  check(res, {
    'status was 200 or 401': (r) => r.status === 200 || r.status === 401, // Mock logic toleration
    'transaction time OK': (r) => r.timings.duration < 300,
  });

  sleep(1);
}
