import React, { useEffect } from "react";
import { useRoute, Route, RouteProps } from "wouter";
import ReactGA from "react-ga4";
const TrackedRoute = (props: RouteProps<any>) => {
  const [match] = useRoute(props?.path || "undefined");

  useEffect(() => {
    if (match) {
      ReactGA.send({
        hitType: "pageview",
        page: props.path,
      });
    }
  }, [match]);
  return <Route {...props} />;
};
export default TrackedRoute;
