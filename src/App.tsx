import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import Morning from '@/pages/Morning';
import Today from '@/pages/Today';
import Ongoing from '@/pages/Ongoing';
import Energy from '@/pages/Energy';
import Sentence from '@/pages/Sentence';
import Review from '@/pages/Review';

export default function App() {
  return (
    <Router>
      <Routes>
        {/* 早安页面 - 独立全屏 */}
        <Route path="/" element={<Morning />} />
        {/* 主应用 */}
        <Route element={<Layout />}>
          <Route path="/today" element={<Today />} />
          <Route path="/ongoing" element={<Ongoing />} />
          <Route path="/energy" element={<Energy />} />
          <Route path="/sentence" element={<Sentence />} />
          <Route path="/review" element={<Review />} />
        </Route>
      </Routes>
    </Router>
  );
}
