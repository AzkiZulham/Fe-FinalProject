"use client";

import { Card } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";
import { TabsList } from "@/components/ui/tabs";
import { TabsTrigger } from "@/components/ui/tabs";
import { TabsContent } from "@/components/ui/tabs";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import ProtectedPage from "@/components/protectedPage";
import { useAuth } from "@/context/authContext";
import AvatarUpload from "./avatarUpload";
import PersonalInfoForm from "./personalInfoForm";
import SecurityForm from "./securityForm";
import { UserData } from "./types";

export default function UpdateProfilePage() {
  const { user } = useAuth();

  const [userData, setUserData] = useState<UserData>({
    userName: "",
    email: "",
    phoneNumber: "",
    birthDate: "",
    gender: "",
    avatar: "",
    verified: false,
    isEmailUpdated: false,
  });

  useEffect(() => {
    if (user) {
      setUserData({
        userName: user.username || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
        birthDate: user.birthDate ? user.birthDate.split("T")[0] : "",
        gender: user.gender || "",
        avatar: user.avatar || "",
        verified: user.verified || false,
        isEmailUpdated: false,
      });
    }
  }, [user]);

  return (
    <ProtectedPage role="USER">
      <main className="min-h-screen bg-[#f8fafc] mb-20">
        <section className="relative bg-gradient-to-r from-[#2f567a] to-[#4c7ba5] py-20 text-white">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto flex flex-col items-center text-center px-4"
          >
            <AvatarUpload userData={userData} setUserData={setUserData} />
          </motion.div>
        </section>

        <section className="max-w-3xl mx-auto px-4 -mt-10 relative z-10">
          <Card className="shadow-lg border-0 bg-white rounded-2xl p-6">
            <Tabs defaultValue="info" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-gray-100 rounded-xl p-1 mb-6">
                <TabsTrigger
                  value="info"
                  className="data-[state=active]:bg-[#2f567a] data-[state=active]:text-white rounded-lg"
                >
                  Informasi Personal
                </TabsTrigger>
                <TabsTrigger
                  value="security"
                  className="data-[state=active]:bg-[#2f567a] data-[state=active]:text-white rounded-lg"
                >
                  Keamanan
                </TabsTrigger>
              </TabsList>

              <TabsContent value="info">
                <PersonalInfoForm
                  userData={userData}
                  setUserData={setUserData}
                />
              </TabsContent>

              <TabsContent value="security">
                <SecurityForm />
              </TabsContent>
            </Tabs>
          </Card>
        </section>
      </main>
    </ProtectedPage>
  );
}
