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
  GET_SKILLS,
  GET_MODULE_CHILDREN,
} from '@/graphql/queries';
import CardDataStats from './components/CardDataStats';
import LineChart from './components/Charts/LineChart';
import { ApolloError } from '@apollo/client';
import PieChart from './components/Charts/PieChart';
import Table from './components/Table';

const Dashboard: React.FC = () => {
  // check if the user is not logged in redirect to login
  const router = useRouter();
  const [user, setUser] = useState<User>();
  const [moduleEvent, setModuleEvent] = useState<UserModuleEvent>();
  const [xps, setXPs] = useState<Transaction[]>();
  const [skills, setSkills] = useState<Skill[]>();
  const [projects, setProjects] = useState<Map<string, Project>>();
  const [openProjects, setOpenProjects] = useState<Map<string, Project>>();

  const fetchDashboardData = async (token: string) => {
    try {
      // get user data
      const userRes = await fetchGQLData(GET_USER_WITH_AUDIT, token);
      const userData = userRes.data;
      if (!userData || userData.user.length === 0) {
        console.error('No user found');
        return;
      }
      setUser(userData.user[0]);

      // get module event data
      const eventsRes = await fetchGQLData(GET_MODULE_EVENT, token, {
        userId: userData.user[0].id,
        modulePath: '/bahrain/bh-module',
      });
      const moduleEventData = eventsRes.data;
      if (
        moduleEventData.user.length === 0 ||
        moduleEventData.user[0].events.length === 0
      ) {
        console.error('No user or module found');
        return;
      }
      setModuleEvent(moduleEventData.user[0].events[0]);

      // get user xp
      const xpRes = await fetchGQLData(GET_XP, token, {
        userId: userData.user[0].id,
        rootEventId: moduleEventData.user[0].events[0].eventId,
      });
      const xpData = xpRes.data;
      if (xpData.xp.aggregate.sum.amount === null) {
        console.error('No xp found');
        return;
      }
      const updatedUser = {
        ...userData.user[0],
        xp: xpData.xp.aggregate.sum.amount,
      };
      setUser(updatedUser);

      // get xp progresstion data
      const xpsRes= await fetchGQLData(
        GET_PROJECTS_TRANSACTIONS,
        token,
        {
          userId: userData.user[0].id,
          eventId: moduleEventData.user[0].events[0].eventId,
        },
      );
      const xpsData = xpsRes.data;
      if (!xpsData.transaction) {
        console.error('No xp progression found');
        return;
      }

      setXPs(xpsData.transaction);

      // get user skills
      const skillsRes = await fetchGQLData(GET_SKILLS, token, {
        userId: userData.user[0].id,
      });
      const skillsData = skillsRes.data;
      if (!skillsData.transaction) {
        console.error('No skills found');
        return;
      }
      const skills = skillsData.transaction;
      const sortedSkills = [...skills].sort((a, b) => b.amount - a.amount);
      setSkills(sortedSkills);

      // get
      const modChildrenRes = await fetchGQLData(
        GET_MODULE_CHILDREN,
        token,
        {
          eventId: moduleEventData.user[0].events[0].eventId,
          registrationId:
            moduleEventData.user[0].events[0].event.registrationId,
        },
      );
      const modChildrenData = modChildrenRes.data;
      if (!modChildrenData.object[0].childrenRelation) {
        console.error('No projects found');
        return;
      }
      const allProjects = modChildrenData.object[0].childrenRelation;
      const projectsMap = new Map();
      allProjects.forEach((project: Project) => {
        if (
          project.paths.length !== 0 &&
          project.paths[0].object.name !== null
        ) {
          projectsMap.set(project.paths[0].object.name, {
            ...project.attrs,
            key: project.key,
          });
        }
      });

      setProjects(projectsMap);
    } catch (error) {
      console.error('Error fetching data:', error);
      if (
        error instanceof ApolloError &&
        error.graphQLErrors &&
        error.graphQLErrors[0].extensions.code === 'invalid-jwt'
      ) {
        localStorage.removeItem('hasura-jwt-token');
        router.push('/login');
      }
      return;
    }
  };

  useEffect(() => {
    if (!moduleEvent || !xps || !skills || !projects) return;
    // create a skills map
    const skillMap = new Map();
    skills.forEach((skill: Skill) => {
      const trimmedKey = skill.type.startsWith('skill_')
        ? skill.type.slice(6)
        : skill.type;
      skillMap.set(trimmedKey, skill.amount);
    });
    const filteredProjects = new Map<string, Project>(
      Array.from(projects.entries()).filter(([key, project]) => {
        // remove any piscine
        if (
          key.toLowerCase().includes('piscine') ||
          key.toLowerCase().includes('checkpoint')
        )
          return false;

        // Check for matching transaction
        if (xps.some((transaction) => transaction.object.name === key)) {
          return false;
        }
        // Exclude the projects that cant be done depending on the core requirement
        const requiredCore = project.requirements?.core;
        if (requiredCore) {
          const trimReqObj = requiredCore.startsWith('../')
            ? requiredCore.slice(3)
            : requiredCore;
          const reqIsDone = xps.some(
            (transaction) => transaction.object.name === trimReqObj,
          );
          if (!reqIsDone) return false;
        }

        // Exclude project if required skills are not met
        const requiredSkills = project.requirements?.skills;
        if (requiredSkills) {
          const allDone = Object.entries(requiredSkills).every(
            ([skill, requiredAmount]) => {
              // Get available amount from skill map, default to 0 if not present
              const availableAmount = skillMap.get(skill) || 0;
              return availableAmount >= requiredAmount;
            },
          );
          if (!allDone) return false;
        }

        // exclude the project if there is required object that the user havnt done
        const requiredObjects = project.requirements?.objects;
        if (requiredObjects) {
          // Check if all required objects exist in xps
          const allDone = requiredObjects.every((requiredObject) => {
            const trimReqObj = requiredObject.startsWith('../')
              ? requiredObject.slice(3)
              : requiredObject;
            const reqIsDone = xps.some(
              (transaction) => transaction.object.name === trimReqObj,
            );
            return reqIsDone;
          });
          if (!allDone) return false;
        }
        return true;
      }),
    );

    // Sort the filtered projects by baseXp in ascending order
    const sortedProjects = Array.from(filteredProjects.entries()).sort(
      (a, b) => a[1].baseXp - b[1].baseXp,
    );
    setOpenProjects(new Map(sortedProjects));
  }, [moduleEvent, xps, skills, projects]);

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
          <CardDataStats
            title="Open Projects"
            total={openProjects ? openProjects.size.toString() : '0'}
            info={openProjects?.size ? Array.from(openProjects.keys()) : []}
          >
            <svg
              className="fill-primary dark:fill-white"
              width="800px"
              height="800px"
              viewBox="-5 -5 42 42"
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g
                id="Icon-Set"
                transform="translate(-568.000000, -463.000000)"
                fill=""
              >
                <path
                  d="M597,481 L570,481 L570,467 C570,465.896 570.896,465 572,465 L595,465 C596.104,465 597,465.896 597,467 L597,481 L597,481 Z M597,485 C597,486.104 596.104,487 595,487 L572,487 C570.896,487 570,486.104 570,485 L570,483 L597,483 L597,485 L597,485 Z M582,489 L586,489 L586,493 L582,493 L582,489 Z M595,463 L572,463 C569.791,463 568,464.791 568,467 L568,485 C568,487.209 569.791,489 572,489 L580,489 L580,493 L578,493 C577.447,493 577,493.448 577,494 C577,494.553 577.447,495 578,495 L590,495 C590.553,495 591,494.553 591,494 C591,493.448 590.553,493 590,493 L588,493 L588,489 L595,489 C597.209,489 599,487.209 599,485 L599,467 C599,464.791 597.209,463 595,463 L595,463 Z"
                  id="desktop"
                  fill=""
                ></path>
              </g>
            </svg>
          </CardDataStats>
        </div>

        <div className="mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-7.5 2xl:gap-7.5">
          <LineChart xps={xps} />
          <PieChart skills={skills} />

          <div className="col-span-12 xl:col-span-12">
            <Table transactions={xps ? xps : []} />
          </div>
        </div>
      </DefaultLayout>
    </>
  );
};

export default Dashboard;
