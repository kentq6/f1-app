import { auth } from "@clerk/nextjs/server";

const UserProfile = async () => {
  const { userId } = await auth();

  return <div>Hello, ${userId}</div>;
};

export default UserProfile;
