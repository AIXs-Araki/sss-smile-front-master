import { useAuth } from '../contexts/AuthContext';

export type LoginUser = {
  cid: number;
  fid: string;
  uid: string;
}
export const useLoginUser = (): LoginUser => {
  const { cid, fid, uid, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return {
      cid: -1,
      fid: "a",
      uid: "",
    }
  }

  return {
    cid: cid! || -1,
    fid: fid! || "a",
    uid: uid! || "",
  };
};