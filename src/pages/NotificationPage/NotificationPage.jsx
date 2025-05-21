import clsx from "clsx";
import { Button } from "@material-tailwind/react";
import AccountInfoComponent from "../../components/AccountInfoComponent/AccountInfoComponent";
import { IoTrashOutline } from "react-icons/io5";
import { useNotifications } from "../../context/NotificationContext";
import {
  readNotification,
  deleteNotification,
} from "../../services/api/NotificationApi";
import { usePopup } from "../../context/PopupContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const NotificationPage = () => {
  const { notifications, setNotifications, fetchNotifications } =
    useNotifications();
  const { showPopup } = usePopup();
  const navigate = useNavigate();
  const markAllAsRead = async () => {
    const unreadNotifications = notifications.filter((n) => !n.isRead);

    await Promise.all(unreadNotifications.map((n) => readNotification(n.id)));

    await fetchNotifications();
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleNotificationClick = async (notification) => {
    const res = await readNotification(notification.id);

    if (res.EC === 0) {
      await fetchNotifications();

      if (notification.orderId) {
        navigate(`/orders/order-details/${notification.orderId}`);
      } else if (notification.discountId) {
        navigate(`/cart`);
      }
    } else {
      showPopup(res.EM, false);
    }
  };

  const handleDeleteNotification = async (id, e) => {
    e.stopPropagation();
    const res = await deleteNotification(id);
    if (res.EC === 0) {
      setNotifications(
        notifications.filter((notification) => notification.id !== id)
      );
      showPopup(res.EM);
    } else showPopup(res.EM, false);
  };

  return (
    <div className="xl:max-w-[1200px] container mx-auto py-10 px-2">
      <div className="lg:flex justify-between gap-6">
        <div className="lg:block pb-10 lg:pb-0">
          <AccountInfoComponent />
        </div>
        <div className="flex-1">
          <div className="flex justify-end mb-4">
            <Button
              onClick={markAllAsRead}
              disabled={notifications.every((n) => n.isRead)}
            >
              Đánh dấu tất cả đã đọc
            </Button>
          </div>

          <div className="space-y-2">
            {notifications.length === 0 ? (
              <p className="text-center uppercase text-xl font-semibold text-gray-600">
                Hiện không có thông báo nào
              </p>
            ) : (
              notifications.map((notification) => (
                <div key={notification.id} className="mb-2">
                  <div
                    className={clsx(
                      "p-4 mb-2 shadow-sm rounded-md cursor-pointer border border-gray-300 transition-all duration-300 relative",
                      {
                        "bg-[#e8eaed] hover:bg-gray-200": !notification.isRead,
                        "bg-white": notification.isRead,
                      }
                    )}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div
                      className="absolute top-2 right-2 text-red-500 hover:text-red-700 cursor-pointer p-2"
                      onClick={(e) =>
                        handleDeleteNotification(notification.id, e)
                      }
                    >
                      <IoTrashOutline size={20} />
                    </div>

                    <div className="flex items-center gap-4">
                      <img
                        src={notification.imageUrl}
                        alt={notification.notifyType}
                        className="w-20 h-20 rounded-md object-cover border"
                      />
                      <div>
                        <h6 className="font-semibold mr-10 sm:mr-0">
                          {notification.notifyTitle}
                        </h6>
                        <p className="text-sm text-gray-600">
                          {notification.notifyDescription}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationPage;
