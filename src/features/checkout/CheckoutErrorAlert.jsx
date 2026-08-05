import { Alert } from "../../components/UI";

export default function CheckoutErrorAlert({ message }) {
  if (!message) return null;

  return (
    <Alert variant="danger" style={{ marginTop: 12 }}>
      {message}
    </Alert>
  );
}
