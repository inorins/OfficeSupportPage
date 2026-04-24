import Head from "next/head";
import Link from "next/link";
import React from "react";

const NotFound: React.FC = () => {
  return (
    <>
      <Head>
        <title>404 - Page Not Found</title>
      </Head>
      <div className="w-full text-center">
        <div className="number">404</div>
        <div className="text">
          <span className="mb-4">Oops!</span>
          <p className="text-2xl font-medium">
            The page you are looking for is not available.
          </p>
        </div>

        <Link href="/">
          <a className="inline-block my-4 bg-blue-500 hover:bg-blue-700/90 text-gray-50 font-bold py-2 px-4 rounded-full">
            Go Back Home
          </a>
        </Link>
      </div>
    </>
  );
};

export default NotFound;
