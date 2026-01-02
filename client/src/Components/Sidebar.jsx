import { Link, useLocation } from "react-router-dom";
// Assuming you are using an icon library like 'lucide-react'
import { Home, User, Book, FileText } from 'lucide-react'; 

export default function Sidebar() {
  const location = useLocation();

  const navItems = [
    { name: "Home", path: "/teacher", icon: <Home size={20} /> },
    { name: "Profile", path: "/teacher/profile", icon: <User size={20} /> },
    { name: "Subjects", path: "/teacher/subjects", icon: <Book size={20} /> },
    { name: "Test Review", path: "/teacher/review", icon: <FileText size={20} /> },
  ];

  return (
    <div className="flex flex-col w-64 bg-cyan-600 text-white p-4">
      <h1 className="text-2xl font-bold mb-8">Dashboard</h1>
      <nav>
        <ul>
          {navItems.map((item) => (
            <li key={item.name} className="mb-2">
              <Link
                to={item.path}
                className={`flex items-center gap-3 p-2 rounded-md transition-colors ${
                  location.pathname === item.path
                    ? "bg-cyan-900"
                    : "hover:bg-cyan-600"
                }`}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}