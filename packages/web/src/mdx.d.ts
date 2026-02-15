declare module "*.mdx" {
  let MDXComponent: (props: any) => JSX.Element;
  export const metadata: {
    title: string;
    description: string;
  };
  export default MDXComponent;
}
