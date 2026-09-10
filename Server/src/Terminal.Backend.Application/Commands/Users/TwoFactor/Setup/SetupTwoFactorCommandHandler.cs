using MediatR;
using Terminal.Backend.Application.Exceptions;
using Terminal.Backend.Core.Abstractions.Repositories;

namespace Terminal.Backend.Application.Commands.Users.TwoFactor.Setup;

internal sealed class SetupTwoFactorCommandHandler
    : IRequestHandler<SetupTwoFactorCommand, SetupTwoFactorResponse>
{
    private readonly IUserRepository _userRepository;

    public SetupTwoFactorCommandHandler(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<SetupTwoFactorResponse> Handle(
        SetupTwoFactorCommand request,
        CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetAsync(
            request.UserId,
            cancellationToken);

        if (user is null)
        {
            throw new UserNotFoundException();
        }

        var secretBytes = OtpNet.KeyGeneration.GenerateRandomKey(20);
        var secret = OtpNet.Base32Encoding.ToString(secretBytes);

        user.SetTwoFactorSecret(secret);

        await _userRepository.UpdateAsync(
            user,
            cancellationToken);

        var otpAuthUrl =
            $"otpauth://totp/TERMINAL:{user.Email.Value}" +
            $"?secret={secret}&issuer=TERMINAL";

        return new SetupTwoFactorResponse(
            secret,
            otpAuthUrl);
    }
}