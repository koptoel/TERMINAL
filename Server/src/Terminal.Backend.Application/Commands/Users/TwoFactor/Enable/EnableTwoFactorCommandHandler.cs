using MediatR;
using Terminal.Backend.Application.Exceptions;
using Terminal.Backend.Core.Abstractions.Repositories;

namespace Terminal.Backend.Application.Commands.Users.TwoFactor.Enable;

internal sealed class EnableTwoFactorCommandHandler
    : IRequestHandler<EnableTwoFactorCommand, bool>
{
    private readonly IUserRepository _userRepository;

    public EnableTwoFactorCommandHandler(
        IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<bool> Handle(
        EnableTwoFactorCommand request,
        CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetAsync(
            request.UserId,
            cancellationToken);

        if (user is null)
        {
            throw new UserNotFoundException();
        }

        if (string.IsNullOrWhiteSpace(user.TwoFactorSecret))
        {
            return false;
        }

        var secretBytes = OtpNet.Base32Encoding.ToBytes(
            user.TwoFactorSecret);

        var totp = new OtpNet.Totp(secretBytes);

        var isValid = totp.VerifyTotp(
            request.Code,
            out _,
            new OtpNet.VerificationWindow(
                previous: 1,
                future: 1));

        if (!isValid)
        {
            return false;
        }

        user.EnableTwoFactor();

        await _userRepository.UpdateAsync(
            user,
            cancellationToken);

        return true;
    }
}