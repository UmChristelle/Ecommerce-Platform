import { useQuery } from "@tanstack/react-query";
import { getMyOrders } from "../api/orders";
import { useAuth } from "../context/AuthContext";
import Spinner from "../components/ui/Spinner";
import Badge from "../components/ui/Badge";
import { User, Package, Calendar } from "lucide-react";
import type { OrderStatus } from "../types";

const statusColors: Record<OrderStatus, "yellow" | "blue" | "purple" | "green" | "red"> = {
  PENDING: "yellow",
  PAID: "blue",
  PROCESSING: "blue",
  SHIPPED: "purple",
  DELIVERED: "green",
  CANCELLED: "red",
};

const Profile = () => {
  const { user } = useAuth();
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["myOrders"],
    queryFn: getMyOrders,
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* User Info */}
      <div className="card flex items-center gap-5 mb-8">
        <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center">
          <User size={32} className="text-primary-600" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">{user?.name}</h1>
          <p className="text-gray-500">{user?.email}</p>
          <span className="inline-block mt-1 bg-primary-100 text-primary-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">
            {user?.role}
          </span>
        </div>
      </div>

      {/* Orders */}
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Package size={20} /> My Orders
      </h2>

      {isLoading ? (
        <div className="flex justify-center py-10"><Spinner size="lg" /></div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 text-gray-400 card">
          <Package size={48} className="mx-auto mb-3 opacity-30" />
          <p>No orders yet. Start shopping!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="card">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <div>
                  <p className="text-xs text-gray-400 font-mono">#{order.id.slice(0, 8)}</p>
                  <p className="font-semibold text-gray-900">
                    {order.items?.length ?? 0} item{(order.items?.length ?? 0) !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge label={order.status} color={statusColors[order.status]} />
                  <span className="font-bold text-primary-600">${order.total?.toFixed(2)}</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <Calendar size={12} />
                {new Date(order.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Profile;
