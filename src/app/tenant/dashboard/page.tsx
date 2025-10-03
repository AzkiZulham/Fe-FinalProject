export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Tenant Dashboard</h1>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-semibold">Total Properties</h2>
          <p className="text-3xl font-bold mt-2 text-[#2f567a]">12</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-semibold">Total Rooms</h2>
          <p className="text-3xl font-bold mt-2 text-[#2f567a]">48</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-semibold">Occupancy Rate</h2>
          <p className="text-3xl font-bold mt-2 text-[#2f567a]">82%</p>
        </div>
      </div>
    </div>
  );
}
