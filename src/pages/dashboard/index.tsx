import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import DefaultLayout from '@/components/Layout';
import { fetchGQLData } from '@/graphql/client';
import {
  GET_MODULE_EVENT,
  GET_PROJECTS_TRANSACTIONS,
  GET_USER_WITH_AUDIT,
  GET_XP,
} from '@/graphql/queries';
import CardDataStats from './components/CardDataStats';
import LineChart from './components/Charts/LineChart';
import { ApolloError } from '@apollo/client';
import PieChart from './components/Charts/PieChart';

const Dashboard: React.FC = () => {
  // check if the user is not logged in redirect to login
  const router = useRouter();
  const [user, setUser] = useState<User>();
  const [moduleEvent, setModuleEvent] = useState<UserModuleEvent>();
  const [xps, setXPs] = useState<Transaction[]>();
  const fetchDashboardData = async (token: string) => {
    try {
      const userData = await fetchGQLData(GET_USER_WITH_AUDIT, token);
      if (userData.user.length === 0) {
        console.error('No user found');
        return;
      }
      setUser(userData.user[0]);
      const moduleEventData = await fetchGQLData(GET_MODULE_EVENT, token, {
        userId: userData.user[0].id,
        modulePath: '/bahrain/bh-module',
      });
      if (
        moduleEventData.user.length === 0 ||
        moduleEventData.user[0].events.length === 0
      ) {
        console.error('No user or module found');
        return;
      }
      setModuleEvent(moduleEventData.user[0].events[0]);
      const xpData = await fetchGQLData(GET_XP, token, {
        userId: userData.user[0].id,
        rootEventId: moduleEventData.user[0].events[0].eventId,
      });
      if (xpData.xp.aggregate.sum.amount === null) {
        console.error('No xp found');
        return
      }
      const updatedUser = {
        ...userData.user[0],
        xp: xpData.xp.aggregate.sum.amount,
      };
      setUser(updatedUser);
      const xpProgressionData = await fetchGQLData(
        GET_PROJECTS_TRANSACTIONS,
        token,
        {
          userId: userData.user[0].id,
          eventId: moduleEventData.user[0].events[0].eventId,
        },
      );
      if (!xpProgressionData.transaction) {
        console.error('No xp progression found');
        return;
      }
      setXPs(xpProgressionData.transaction);
    } catch (error) {
      console.error('Error fetching data:', error);
      if (
        error instanceof ApolloError &&
        error.graphQLErrors &&
        error.graphQLErrors[0].extensions.code === 'invalid-jwt'
      ) {
        localStorage.removeItem('hasura-jwt-token');
      }
      return;
    }
  };
  useEffect(() => {
    const token = localStorage.getItem('hasura-jwt-token');
    if (!token) {
      router.push('/login'); // Redirect to login if token does not exist
      return;
    }
    fetchDashboardData(token);
  }, []);
  return (
    <>
      <Head>
        <title>Dashboard</title>
      </Head>
      <DefaultLayout user={user}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5">
          <CardDataStats
            title="Level"
            total={moduleEvent ? moduleEvent.level.toString() : ''}
          >
            <svg
              className="fill-primary dark:fill-white"
              width="800px"
              height="800px"
              viewBox="-7 -7 50 50"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill=""
                d="M30.000,32.000 L23.000,32.000 C22.447,32.000 22.000,31.552 22.000,31.000 L22.000,1.000 C22.000,0.448 22.447,-0.000 23.000,-0.000 L30.000,-0.000 C30.553,-0.000 31.000,0.448 31.000,1.000 L31.000,31.000 C31.000,31.552 30.553,32.000 30.000,32.000 ZM29.000,2.000 L24.000,2.000 L24.000,30.000 L29.000,30.000 L29.000,2.000 ZM19.000,32.000 L12.000,32.000 C11.448,32.000 11.000,31.552 11.000,31.000 L11.000,17.000 C11.000,16.448 11.448,16.000 12.000,16.000 L19.000,16.000 C19.553,16.000 20.000,16.448 20.000,17.000 L20.000,31.000 C20.000,31.552 19.553,32.000 19.000,32.000 ZM18.000,18.000 L13.000,18.000 L13.000,30.000 L18.000,30.000 L18.000,18.000 ZM8.000,32.000 L1.000,32.000 C0.448,32.000 0.000,31.552 0.000,31.000 L0.000,11.000 C0.000,10.448 0.448,10.000 1.000,10.000 L8.000,10.000 C8.552,10.000 9.000,10.448 9.000,11.000 L9.000,31.000 C9.000,31.552 8.552,32.000 8.000,32.000 ZM7.000,12.000 L2.000,12.000 L2.000,30.000 L7.000,30.000 L7.000,12.000 Z"
              />
            </svg>
          </CardDataStats>
          <CardDataStats
            title="Total XP"
            total={
              user?.xp
                ? (Math.round(user.xp / 10000) / 100).toString() + 'MB'
                : ''
            }
          >
            <svg
              className="fill-primary dark:fill-white"
              width="800px"
              height="800px"
              viewBox="0 0 32 32"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M16.526 23h1.414l.977-4.923 2.306.01c1.61 0 2.934-.412 3.973-1.236 1.04-.824 1.633-1.921 1.779-3.293.088-.941-.056-1.76-.434-2.455l-2.73 1.427c.02.11.031.223.035.335.022.872-.183 1.566-.615 2.083-.432.516-1.04.78-1.822.793l-2.031-.02.194-.975-3.515 1.837-.64 3.245-.862-2.46-2.645 1.383L12.992 23zm-1.315-10.99h1.75l-.532 2.693 3.516-1.838.3-1.51 2.295.02c.07.004.14.013.208.026l2.8-1.464c-.746-.586-1.701-.895-2.866-.927L17.556 9h-2.215l-1.88 3.01h1.75-1.75l-1.051 1.779L11.18 9H7.7l2.372 6.827-2.467 3.49 6.659-3.482 2.697-3.826zM16 32C7.163 32 0 24.837 0 16S7.163 0 16 0s16 7.163 16 16-7.163 16-16 16zM5.786 21.952l-.02-.037L5 23h3.765l2.348-3.833z"
                fill=""
              />
            </svg>
          </CardDataStats>
          <CardDataStats
            title="Audit ratio"
            total={
              user ? (Math.round(user.auditRatio * 10) / 10).toString() : ''
            }
            rateUp={
              user
                ? (Math.round(user.totalUp / 10000) / 100).toString() + 'MB'
                : ''
            }
            rateDown={
              user
                ? (Math.round(user.totalDown / 10000) / 100).toString() + 'MB'
                : ''
            }
          >
            <svg
              className="fill-primary dark:fill-white"
              width="800px"
              height="800px"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4,21a1,1,0,0,1-.71-.29,1,1,0,0,1,0-1.42l16-16a1,1,0,1,1,1.42,1.42l-16,16A1,1,0,0,1,4,21Z"
                fill=""
              ></path>
            </svg>
          </CardDataStats>
          <CardDataStats title="Total Users" total="3.456">
            <svg
              className="fill-primary dark:fill-white"
              width="22"
              height="18"
              viewBox="0 0 22 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M7.18418 8.03751C9.31543 8.03751 11.0686 6.35313 11.0686 4.25626C11.0686 2.15938 9.31543 0.475006 7.18418 0.475006C5.05293 0.475006 3.2998 2.15938 3.2998 4.25626C3.2998 6.35313 5.05293 8.03751 7.18418 8.03751ZM7.18418 2.05626C8.45605 2.05626 9.52168 3.05313 9.52168 4.29063C9.52168 5.52813 8.49043 6.52501 7.18418 6.52501C5.87793 6.52501 4.84668 5.52813 4.84668 4.29063C4.84668 3.05313 5.9123 2.05626 7.18418 2.05626Z"
                fill=""
              />
              <path
                d="M15.8124 9.6875C17.6687 9.6875 19.1468 8.24375 19.1468 6.42188C19.1468 4.6 17.6343 3.15625 15.8124 3.15625C13.9905 3.15625 12.478 4.6 12.478 6.42188C12.478 8.24375 13.9905 9.6875 15.8124 9.6875ZM15.8124 4.7375C16.8093 4.7375 17.5999 5.49375 17.5999 6.45625C17.5999 7.41875 16.8093 8.175 15.8124 8.175C14.8155 8.175 14.0249 7.41875 14.0249 6.45625C14.0249 5.49375 14.8155 4.7375 15.8124 4.7375Z"
                fill=""
              />
              <path
                d="M15.9843 10.0313H15.6749C14.6437 10.0313 13.6468 10.3406 12.7874 10.8563C11.8593 9.61876 10.3812 8.79376 8.73115 8.79376H5.67178C2.85303 8.82814 0.618652 11.0625 0.618652 13.8469V16.3219C0.618652 16.975 1.13428 17.4906 1.7874 17.4906H20.2468C20.8999 17.4906 21.4499 16.9406 21.4499 16.2875V15.4625C21.4155 12.4719 18.9749 10.0313 15.9843 10.0313ZM2.16553 15.9438V13.8469C2.16553 11.9219 3.74678 10.3406 5.67178 10.3406H8.73115C10.6562 10.3406 12.2374 11.9219 12.2374 13.8469V15.9438H2.16553V15.9438ZM19.8687 15.9438H13.7499V13.8469C13.7499 13.2969 13.6468 12.7469 13.4749 12.2313C14.0937 11.7844 14.8499 11.5781 15.6405 11.5781H15.9499C18.0812 11.5781 19.8343 13.3313 19.8343 15.4625V15.9438H19.8687Z"
                fill=""
              />
            </svg>
          </CardDataStats>
        </div>

        <div className="mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-7.5 2xl:gap-7.5">
          <LineChart xps={xps} />
          <PieChart />

          {/*<ChartTwo />
        <MapOne />
        <div className="col-span-12 xl:col-span-8">
          <TableOne />
        </div>
        <ChatCard /> */}
        </div>
      </DefaultLayout>
    </>
  );
};

export default Dashboard;
