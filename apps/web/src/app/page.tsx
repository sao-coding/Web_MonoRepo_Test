import { Button } from "@msi/ui/components/button";
import Link from "next/link";

const Home = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold underline">Hello world!</h1>
      <Button>Click Me</Button>
      <Link href="/about">Go to About Page</Link>
    </div>
  );
};

export default Home;
