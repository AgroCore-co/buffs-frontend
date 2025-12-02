import { render, screen, fireEvent } from '@testing-library/react';
import Button from '../Button';

describe('Button Component', () => {
  it('deve renderizar o botão com o texto correto', () => {
    render(<Button>Clique aqui</Button>);

    const button = screen.getByText('Clique aqui');
    expect(button).toBeInTheDocument();
  });

  it('deve chamar onClick quando clicado', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Clique aqui</Button>);

    const button = screen.getByText('Clique aqui');
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('deve estar desabilitado quando a prop disabled é true', () => {
    render(<Button disabled>Botão Desabilitado</Button>);

    const button = screen.getByText('Botão Desabilitado');
    expect(button).toBeDisabled();
  });
});
