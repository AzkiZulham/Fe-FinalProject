import { Suspense } from "react";
import RegisterUser from "./registerUserClient";

export const dynamic = 'force-dynamic';

export default function RegisterUserPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RegisterUser />
    </Suspense>
  );
}
