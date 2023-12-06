"use client";

import { Me } from "components/Me";
import { User } from "components/User";

export default function Profile() {
  return (
    <div>
      <p>Your user profile:</p>
      <User />
      <p>Response from HTTP GET /api/proxy/v1/me:</p>
      <Me />
    </div>
  );
}
