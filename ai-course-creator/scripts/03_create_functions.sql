-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to calculate course completion percentage
CREATE OR REPLACE FUNCTION public.calculate_course_completion(p_user_id UUID, p_course_id UUID)
RETURNS INTEGER AS $$
DECLARE
  total_lessons INTEGER;
  completed_lessons INTEGER;
  completion_percentage INTEGER;
BEGIN
  -- Get total number of lessons in the course
  SELECT COUNT(*)
  INTO total_lessons
  FROM public.lessons l
  JOIN public.modules m ON m.id = l.module_id
  WHERE m.course_id = p_course_id;

  -- Get number of completed lessons
  SELECT COUNT(*)
  INTO completed_lessons
  FROM public.user_progress up
  JOIN public.lessons l ON l.id = up.lesson_id
  JOIN public.modules m ON m.id = l.module_id
  WHERE up.user_id = p_user_id
    AND m.course_id = p_course_id
    AND up.completed = true;

  -- Calculate percentage
  IF total_lessons > 0 THEN
    completion_percentage := (completed_lessons * 100) / total_lessons;
  ELSE
    completion_percentage := 0;
  END IF;

  RETURN completion_percentage;
END;
$$ LANGUAGE plpgsql;
