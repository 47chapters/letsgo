"use client";

export default function Join() {
  const handleAccept = async () => {
    window.location.href = `${window.location.pathname}/accept`;
  };

  return (
    <div>
      <p>You are are invited to join the service.</p>
      <button onClick={handleAccept}>Accept invitation</button>
    </div>
  );
}
