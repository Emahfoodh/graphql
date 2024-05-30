import DefaultLayout from '@/components/Layout';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import ProfileComponent from '@/components/Profile';
import { GET_USER } from '@/graphql/queries';
import { fetchGQLData } from '@/graphql/client';

const Profile: React.FC = () => {
  const router = useRouter();
  const [user, setUser] = useState<User>();
  useEffect(() => {
    const token = localStorage.getItem('hasura-jwt-token');
    if (!token) {
      router.push('/login');
      return
    }
    fetchGQLData(GET_USER, token)
    .then(data => setUser(data.user[0]))
    .catch(error => console.error('Error fetching data:', error));
  }, []);
  return (
    <>
      <Head>
        <title>Profile</title>
      </Head>
      <DefaultLayout user={user}>
        <ProfileComponent user={user} />
      </DefaultLayout>
    </>
  );
};

export default Profile;
