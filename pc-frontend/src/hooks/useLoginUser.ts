import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export type LoginUser = {
  cid: number;
  fid: string;
  uid: string;
}
export const useLoginUser = (): LoginUser => {
  const { cid, fid, uid, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    navigate("/login")
    return { cid: -1, fid: "", uid: "" }
  }

  return {
    cid: cid! || -1,
    fid: fid! || "a",
    uid: uid! || "",
  };
};