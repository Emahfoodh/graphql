import Link from 'next/link';
import DropdownUser from './DropdownUser';
import Image from 'next/image';
import DarkModeSwitcher from './DarkModeSwitcher';

interface HeaderProps {
  user: User;
}

const Header: React.FC<HeaderProps> = ({ user }) => {
  return (
    <header className="sticky top-0 z-999 flex w-full bg-white drop-shadow-1 dark:bg-boxdark dark:drop-shadow-none">
      <div className="flex flex-grow items-center justify-between px-4 py-4 shadow-2 md:px-6 2xl:px-11">
        <Link href="/" className="flex items-center">
          <Image
            className="h-10 w-auto"
            src={'/images/logo.png'}
            alt="Logo"
            width={176}
            height={32}
          />
        </Link>

        <div className="flex items-center gap-3 2xsm:gap-7">
          <ul className="flex items-center gap-2 2xsm:gap-4">
            {/* <!-- Dark Mode Toggler --> */}
            <DarkModeSwitcher />
            {/* <!-- Dark Mode Toggler --> */}

            {/* <!-- Notification Menu Area --> */}
            {/* <DropdownNotification /> */}
            {/* <!-- Notification Menu Area --> */}
          </ul>

          {/* <!-- User Area --> */}
          <DropdownUser user={user} />
          {/* <!-- User Area --> */}
        </div>
      </div>
    </header>
  );
};

export default Header;
