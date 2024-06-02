import React from 'react';

interface TableProps {
  transactions: Transaction[];
}

const Table: React.FC<TableProps> = ({ transactions }) => {
  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
        Transactions history
      </h4>

      <div className="flex flex-col overflow-auto max-h-[400px]">
        {' '}
        {/* Added overflow-auto and max-h */}
        <div className="grid grid-cols-3 rounded-sm bg-gray-2 dark:bg-meta-4 sm:grid-cols-3">
          <div className="p-2.5 xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              Project
            </h5>
          </div>
          <div className="p-2.5 text-center xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">XP</h5>
          </div>
          <div className="hidden p-2.5 text-center sm:block xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              Transaction time
            </h5>
          </div>
        </div>
        {transactions &&
          transactions
            .slice()
            .sort((a: Transaction, b: Transaction) => {
              return (
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
              );
            })
            .map((transaction, key) => (
              <div
                className={`grid grid-cols-3 sm:grid-cols-3 ${
                  key === transactions.length - 1
                    ? ''
                    : 'border-b border-stroke dark:border-strokedark'
                }`}
                key={key}
              >
                <div className="flex items-center gap-3 p-2.5 xl:p-5">
                  <p className="hidden text-black dark:text-white sm:block">
                    {transaction.object.name}
                  </p>
                </div>

                <div className="flex items-center justify-center p-2.5 xl:p-5">
                  <p className="text-meta-3">{transaction.amount / 1000}KB</p>{' '}
                </div>

                <div className="hidden items-center justify-center p-2.5 sm:flex xl:p-5">
                  <p className="text-meta-5">
                    {new Date(transaction.createdAt).toLocaleString()}
                  </p>{' '}
                </div>
              </div>
            ))}
      </div>
    </div>
  );
};

export default Table;
