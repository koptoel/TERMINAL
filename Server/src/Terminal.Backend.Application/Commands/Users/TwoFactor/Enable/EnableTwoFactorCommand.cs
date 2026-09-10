using MediatR;
using Terminal.Backend.Core.ValueObjects;

namespace Terminal.Backend.Application.Commands.Users.TwoFactor.Enable;

public sealed record EnableTwoFactorCommand(
    UserId UserId,
    string Code) : IRequest<bool>;