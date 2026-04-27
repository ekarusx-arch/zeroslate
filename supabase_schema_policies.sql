-- Brain Dumps 정책
CREATE POLICY "Users can view own brain_dumps" ON public.brain_dumps FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own brain_dumps" ON public.brain_dumps FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own brain_dumps" ON public.brain_dumps FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own brain_dumps" ON public.brain_dumps FOR DELETE USING (auth.uid() = user_id);

-- Top Three 정책
CREATE POLICY "Users can view own top_three" ON public.top_three FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own top_three" ON public.top_three FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own top_three" ON public.top_three FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own top_three" ON public.top_three FOR DELETE USING (auth.uid() = user_id);

-- Time Blocks 정책
CREATE POLICY "Users can view own time_blocks" ON public.time_blocks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own time_blocks" ON public.time_blocks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own time_blocks" ON public.time_blocks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own time_blocks" ON public.time_blocks FOR DELETE USING (auth.uid() = user_id);
