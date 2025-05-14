export default function LoadingScreen() {
    return (
      <div
        className="w-screen h-screen bg-cover bg-center flex flex-col items-center justify-center text-white"
        style={{
          backgroundImage: "https://github.com/travan/letEnjoyYourMeals/blob/main/website/public/icon3.png",
        }}
      >
        <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mb-6"></div>

        <h1 className="text-2xl font-semibold text-center">
          Please wait a moment
        </h1>
        <p className="mt-2 text-lg">Chờ chúng tôi một chút nhé</p>
      </div>
    );
  }