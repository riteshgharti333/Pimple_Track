import { NavLink, useLocation } from "react-router-dom";
import { FaHome, FaPlus, FaHistory, FaUser } from "react-icons/fa";

const BottomBar = () => {
  const location = useLocation();

  const navItems = [
    { path: "/", label: "Home", icon: FaHome },
    { path: "/history", label: "History", icon: FaHistory },
    { path: "/add", label: "Add", icon: FaPlus },
    { path: "/profile", label: "Profile", icon: FaUser },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-blue-100">
      <div className="max-w-md mx-auto">
        <div className="flex h-14">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <NavLink key={item.path} to={item.path} className="flex-1">
                <div className="h-full flex flex-col items-center justify-center relative">
                  <div
                    className={`mb-1 transition-colors ${
                      isActive ? "text-blue-600" : "text-gray-400"
                    }`}
                  >
                    <Icon size={20} />
                  </div>
                  <span
                    className={`text-xs transition-colors ${
                      isActive ? "text-blue-600 font-semibold" : "text-gray-500"
                    }`}
                  >
                    {item.label}
                  </span>
                </div>
              </NavLink>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BottomBar;
