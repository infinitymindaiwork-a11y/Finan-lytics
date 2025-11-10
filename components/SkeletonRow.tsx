import React from 'react';

export const SkeletonRow: React.FC = () => (
    <tr className="border-b border-border-light dark:border-border-dark last:border-b-0">
        <td className="p-4"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse"></div></td>
        <td className="p-4"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-40 animate-pulse"></div></td>
        <td className="p-4"><div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-28 animate-pulse"></div></td>
        <td className="p-4"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 ml-auto animate-pulse"></div></td>
    </tr>
);