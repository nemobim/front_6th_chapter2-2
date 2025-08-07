import { useAtom } from "jotai";
import { activeTabAtom } from "../../atoms/adminAtoms";
import { ADMIN_TABS, TActiveTab } from "../../constants/adminConstants";

const AdminNavigation = () => {
  /** 활성 탭 상태 - Jotai 사용 */
  const [activeTab, setActiveTab] = useAtom(activeTabAtom);

  /** 탭 클릭 시 활성화 탭 변경 */
  const handleActiveTab = (tab: TActiveTab) => {
    setActiveTab(tab);
  };

  return (
    <div className="border-b border-gray-200 mb-6">
      <nav className="-mb-px flex space-x-8">
        {ADMIN_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => handleActiveTab(tab.value)}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === tab.value ? "border-gray-900 text-gray-900" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default AdminNavigation;
