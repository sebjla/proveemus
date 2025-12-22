import React from 'react';
import { OrderStatus } from '../types';

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

const statusColors: Record<OrderStatus, string> = {
  [OrderStatus.PENDING_APPROVAL]: 'bg-gray-100 text-gray-800',
  [OrderStatus.IN_REVIEW]: 'bg-yellow-100 text-yellow-800',
  [OrderStatus.IN_PREPARATION]: 'bg-blue-100 text-blue-800',
  [OrderStatus.ON_ITS_WAY]: 'bg-indigo-100 text-indigo-800',
  [OrderStatus.DELIVERED]: 'bg-green-100 text-green-800',
  [OrderStatus.REJECTED]: 'bg-red-100 text-red-800',
};

export const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ status }) => {
  return (
    <span
      className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${statusColors[status]}`}
    >
      {status}
    </span>
  );
};