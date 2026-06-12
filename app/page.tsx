export default function Home() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-white mb-8">𝕏</h1>
        <p className="text-white text-xl mb-8">今すぐはじめよう</p>
        <div className="flex flex-col gap-4">
          <a href="/register"
            className="bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-gray-200"
          >
            アカウント作成
          </a>
          <a href="/login"
            className="border border-white text-white px-8 py-3 rounded-full font-bold hover:bg-gray-900"
          >
            ログイン
          </a>
        </div>
      </div>
    </div>
  );
}