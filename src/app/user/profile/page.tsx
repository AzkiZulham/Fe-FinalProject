import { Suspense } from "react";
import UpdateProfilePage from "../../../components/profile/updateProfilePage";

export const dynamic = 'force-dynamic';

export default function ProfilePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UpdateProfilePage />
    </Suspense>
  );
}
