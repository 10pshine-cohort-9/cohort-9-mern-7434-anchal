import { useState } from 'react';
import { Eye, EyeOff, LockKeyhole } from 'lucide-react';

interface PasswordInputProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  minLength?: number;
}

const PasswordInput = ({
  id,
  value,
  onChange,
  placeholder,
  minLength,
}: PasswordInputProps) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="input-wrapper">
      <LockKeyhole size={18} />
      <input
        id={id}
        type={showPassword ? 'text' : 'password'}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        minLength={minLength}
        required
      />
      <button
        type="button"
        className="password-toggle"
        onClick={() => setShowPassword((previous) => !previous)}
        aria-label={showPassword ? 'Hide password' : 'Show password'}
      >
        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
};

export default PasswordInput;